# Blender: print what is inside a Rocketbox avatar FBX and an animation FBX.
import bpy, sys
args = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=args[0])
for o in bpy.data.objects:
    extra = ''
    if o.type == 'MESH':
        extra = f"tris={sum(len(p.vertices)-2 for p in o.data.polygons)} mats={[m.name for m in o.data.materials]}"
    if o.type == 'ARMATURE':
        extra = f"bones={len(o.data.bones)} first={[b.name for b in o.data.bones][:6]}"
    print('OBJ', o.name, o.type, tuple(round(v, 3) for v in o.dimensions), o.scale[:], extra)
for m in bpy.data.materials:
    imgs = [n.image.filepath for n in (m.node_tree.nodes if m.node_tree else []) if n.type == 'TEX_IMAGE' and n.image]
    print('MAT', m.name, m.blend_method if hasattr(m, 'blend_method') else '', imgs)
for a in bpy.data.actions:
    print('ACT', a.name, a.frame_range[:])
if len(args) > 1:
    n0 = set(bpy.data.actions.keys())
    bpy.ops.import_scene.fbx(filepath=args[1])
    for a in bpy.data.actions:
        if a.name not in n0:
            print('ANIM', a.name, a.frame_range[:], 'fps', bpy.context.scene.render.fps)
    print('ALLOBJ', [o.name for o in bpy.data.objects])
