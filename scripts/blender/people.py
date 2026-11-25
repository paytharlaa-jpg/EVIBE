# Blender: turn a Microsoft Rocketbox avatar (MIT) + animation FBXs into one
# web-ready GLB (Draco, WebP textures, one glTF animation per clip).
# Usage: blender -b --python people.py -- '<json>'
# json: {"avatar": "...fbx", "out": "...glb", "tex": 1024, "clips": {"walk": "...fbx", ...}, "inplace": ["walk"]}
import bpy, sys, json, os

cfg = json.loads(sys.argv[sys.argv.index('--') + 1])
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.fps = 30


def fcurves_of(act):
    """All F-curves of an action (Blender 4.4+ layered actions and older ones)."""
    out = []
    for layer in getattr(act, 'layers', []):
        for strip in layer.strips:
            for cb in getattr(strip, 'channelbags', []):
                out.extend(cb.fcurves)
    if not out and hasattr(act, 'fcurves'):
        out = list(act.fcurves)
    return out, act


def remove_fcurve(act, fc):
    for layer in getattr(act, 'layers', []):
        for strip in layer.strips:
            for cb in getattr(strip, 'channelbags', []):
                if fc in list(cb.fcurves):
                    cb.fcurves.remove(fc)
                    return
    if hasattr(act, 'fcurves'):
        act.fcurves.remove(fc)


bpy.ops.import_scene.fbx(filepath=cfg['avatar'])
arm = next(o for o in scene.objects if o.type == 'ARMATURE')
mesh = next(o for o in scene.objects if o.type == 'MESH')
for o in list(scene.objects):
    if o not in (arm, mesh):
        bpy.data.objects.remove(o, do_unlink=True)
for a in list(bpy.data.actions):
    bpy.data.actions.remove(a)
arm.name = 'Person'

# materials: keep colour + normal, drop the missing specular maps; hair/lashes use alpha
size = cfg.get('tex', 1024)
for m in mesh.data.materials:
    nt = m.node_tree
    for n in list(nt.nodes):
        if n.type == 'TEX_IMAGE' and n.image and 'specular' in n.image.filepath.lower():
            nt.nodes.remove(n)
    for n in nt.nodes:
        if n.type == 'TEX_IMAGE' and n.image:
            img = n.image
            s = size if 'color' in img.name.lower() else size // 2 if 'head' in img.name.lower() else size
            if max(img.size) > s:
                img.scale(s, s)
        if n.type == 'BSDF_PRINCIPLED':
            n.inputs['Roughness'].default_value = 0.62
            for l in list(n.inputs['Metallic'].links):
                nt.links.remove(l)
            n.inputs['Metallic'].default_value = 0.0
            if 'Specular IOR Level' in n.inputs:
                n.inputs['Specular IOR Level'].default_value = 0.35
    if 'opacity' in m.name.lower():
        m.blend_method = 'CLIP' if hasattr(m, 'blend_method') else None

# animations → NLA tracks (each becomes a named glTF animation).
# Rocketbox animation FBXs import with their own rest pose, so their keys are
# tiny deltas. Retarget instead: constrain every avatar bone to the matching
# source bone in world space, then bake the visual result into a new action.
arm.animation_data_create()
step = cfg.get('step', 2)
for name, path in cfg['clips'].items():
    before = set(bpy.data.objects)
    acts_before = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=path)
    new_objs = [o for o in bpy.data.objects if o not in before]
    src = next(o for o in new_objs if o.type == 'ARMATURE')
    sact = src.animation_data.action
    f0, f1 = int(sact.frame_range[0]), int(sact.frame_range[1])
    cap = cfg.get('trim', {}).get(name)
    if cap:
        f1 = min(f1, cap)
    src_names = {b.name for b in src.data.bones}
    cons = []
    for pb in arm.pose.bones:
        if pb.name not in src_names:
            continue
        c = pb.constraints.new('COPY_ROTATION')
        c.target, c.subtarget = src, pb.name
        c.target_space = c.owner_space = 'WORLD'
        cons.append((pb, c))
        if pb.name == 'Bip01 Pelvis':
            c2 = pb.constraints.new('COPY_LOCATION')
            c2.target, c2.subtarget = src, pb.name
            c2.target_space = c2.owner_space = 'WORLD'
            cons.append((pb, c2))
    bpy.context.view_layer.objects.active = arm
    for o in bpy.context.selected_objects:
        o.select_set(False)
    arm.select_set(True)
    bpy.ops.object.mode_set(mode='POSE')
    arm.animation_data.action = None
    bpy.ops.nla.bake(frame_start=f0, frame_end=f1, step=step, only_selected=False, visual_keying=True,
                     clear_constraints=False, use_current_action=False, bake_types={'POSE'})
    bpy.ops.object.mode_set(mode='OBJECT')
    for pb, c in cons:
        pb.constraints.remove(c)
    act = arm.animation_data.action
    act.name = name
    for fc in list(fcurves_of(act)[0]):
        if fc.data_path.endswith('.scale') or (fc.data_path.endswith('.location') and 'Pelvis' not in fc.data_path):
            remove_fcurve(act, fc)
    act.use_fake_user = True
    for o in new_objs:
        bpy.data.objects.remove(o, do_unlink=True)
    for x in set(bpy.data.actions) - acts_before:
        if x != act:
            bpy.data.actions.remove(x)
    tr = arm.animation_data.nla_tracks.new()
    tr.name = name
    tr.strips.new(name, f0, act)
    arm.animation_data.action = None
    print('CLIP', name, (f0, f1), len(fcurves_of(act)[0]))

# rest pose for export base
for pb in arm.pose.bones:
    pb.location = (0, 0, 0)
    pb.rotation_quaternion = (1, 0, 0, 0)
    pb.rotation_euler = (0, 0, 0)

os.makedirs(os.path.dirname(cfg['out']), exist_ok=True)
bpy.ops.export_scene.gltf(
    filepath=cfg['out'],
    export_format='GLB',
    export_animation_mode='NLA_TRACKS',
    export_anim_single_armature=True,
    export_skins=True,
    export_apply=False,
    export_yup=True,
    export_image_format='WEBP',
    export_image_quality=82,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_morph=False,
    export_optimize_animation_size=True,
)
print('WROTE', cfg['out'], os.path.getsize(cfg['out']))
