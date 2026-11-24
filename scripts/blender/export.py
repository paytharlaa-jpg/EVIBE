# Blender: clean a car .blend and export a web-ready, Draco-compressed GLB.
# Usage: blender -b car.blend --python export.py -- '<json config>'
# config: out, remove (regex), wheel (regex), rotZ (deg, to make the front face −Y),
#         length (metres), body_tris, wheel_tris, preview (png path prefix)
import bpy, sys, re, json, math
from mathutils import Vector, Matrix

_a = sys.argv[sys.argv.index('--') + 1]
cfg = json.load(open(_a)) if _a.endswith('.json') else json.loads(_a)
remove_re = re.compile(cfg.get('remove') or r'^\b$', re.I)
wheel_re = re.compile(cfg.get('wheel') or r'^\b$', re.I)
scene = bpy.context.scene
vl = bpy.context.view_layer

def walk(lc):
    lc.exclude = False
    lc.hide_viewport = False
    for ch in lc.children:
        walk(ch)
walk(vl.layer_collection)

# boolean cutters are tools, not geometry
cutters = set()
for o in bpy.data.objects:
    for m in getattr(o, 'modifiers', []):
        if m.type == 'BOOLEAN':
            if getattr(m, 'object', None):
                cutters.add(m.object.name)
            if getattr(m, 'collection', None):
                cutters.update(x.name for x in m.collection.all_objects)
        if m.type == 'SUBSURF' and cfg.get('subsurf_cap', 1) is not None:  # keep the web budget sane
            m.levels = min(m.levels, cfg.get('subsurf_cap', 1))
            m.render_levels = min(m.render_levels, cfg.get('subsurf_cap', 1))
print('CUTTERS', sorted(cutters))

deps = bpy.context.evaluated_depsgraph_get()
body_parts, wheel_parts = [], []
for o in list(scene.objects):
    if o.type not in {'MESH', 'CURVE', 'SURFACE', 'META', 'FONT'}:
        continue
    if o.hide_render or o.name in cutters or remove_re.search(o.name) or o.display_type in {'BOUNDS', 'WIRE'}:
        print('SKIP', o.name)
        continue
    ev = o.evaluated_get(deps)
    me = bpy.data.meshes.new_from_object(ev, preserve_all_data_layers=True, depsgraph=deps)
    if len(me.polygons) == 0:
        continue
    me.transform(o.matrix_world)
    new = bpy.data.objects.new(o.name + '_x', me)
    scene.collection.objects.link(new)
    (wheel_parts if wheel_re.search(o.name) else body_parts).append(new)

# decimate heavy individual parts (grilles, lenses) before joining; thin
# shells (solidify bodies) can be protected with keep_dense
dense_re = re.compile(cfg.get('keep_dense') or r'^$', re.I)
part_max = cfg.get('part_tris', 10**9)
def _tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)
for o in body_parts:
    if _tris(o) > part_max and not dense_re.search(o.name[:-2]):
        bpy.ops.object.select_all(action='DESELECT')
        o.select_set(True)
        vl.objects.active = o
        m = o.modifiers.new('dec', 'DECIMATE')
        m.ratio = part_max / _tris(o)
        bpy.ops.object.modifier_apply(modifier='dec')
        print('PART_DECIMATED', o.name, _tris(o))

keep = set(body_parts + wheel_parts)
for o in list(scene.objects):
    if o not in keep:
        bpy.data.objects.remove(o, do_unlink=True)

def select_only(objs, active=None):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    vl.objects.active = active or objs[0]

def join(objs, name):
    select_only(objs)
    if len(objs) > 1:
        bpy.ops.object.join()
    j = vl.objects.active
    j.name = name
    j.data.name = name
    return j

body = join(body_parts, 'body')
wheels_all = join(wheel_parts, 'wheels_all') if wheel_parts else None

# orient (front → −Y), scale to real length, sit on the ground, centre
R = Matrix.Rotation(math.radians(cfg.get('rotZ', 0)), 4, 'Z')
objs = [o for o in (body, wheels_all) if o]
for o in objs:
    o.data.transform(R)
def bbox(objs):
    mn = Vector((1e9,) * 3); mx = Vector((-1e9,) * 3)
    for o in objs:
        for v in o.data.vertices:
            for k in range(3):
                mn[k] = min(mn[k], v.co[k]); mx[k] = max(mx[k], v.co[k])
    return mn, mx
mn, mx = bbox(objs)
s = cfg.get('length', 4.7) / (mx.y - mn.y)
T = Matrix.Translation(Vector((-(mn.x + mx.x) / 2, -(mn.y + mx.y) / 2, -mn.z)))
for o in objs:
    o.data.transform(Matrix.Scale(s, 4) @ T)
mn, mx = bbox(objs)
print('SIZE', tuple(round(v, 3) for v in (mx - mn)))

def tris(o):
    return sum(len(p.vertices) - 2 for p in o.data.polygons)

def decimate(o, budget):
    t = tris(o)
    if t <= budget:
        return
    select_only([o])
    m = o.modifiers.new('dec', 'DECIMATE')
    m.ratio = budget / t
    m.use_collapse_triangulate = True
    bpy.ops.object.modifier_apply(modifier='dec')

# split wheels into four by quadrant (loose parts → nearest corner)
wheels = []
if wheels_all:
    select_only([wheels_all])
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.separate(type='LOOSE')
    bpy.ops.object.mode_set(mode='OBJECT')
    parts = [o for o in scene.objects if o.name.startswith('wheels_all')]
    groups = {}
    for p in parts:
        c = sum((Vector(v.co) for v in p.data.vertices), Vector()) / max(1, len(p.data.vertices))
        key = ('front' if c.y < 0 else 'back') + '-' + ('left' if c.x > 0 else 'right')
        groups.setdefault(key, []).append(p)
    for key, ps in groups.items():
        w = join(ps, 'wheel-' + key)
        select_only([w])
        bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
        decimate(w, cfg.get('wheel_tris', 6000))
        wheels.append(w)

decimate(body, cfg.get('body_tris', 140000))

for o in [body] + wheels:
    select_only([o])
    try:
        bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
    except Exception:
        bpy.ops.object.shade_smooth()

print('BODY_TRIS', tris(body), 'WHEELS', {w.name: tris(w) for w in wheels})
print('MATS', sorted({s.material.name for o in [body] + wheels for s in o.material_slots if s.material}))

# preview renders (workbench, material colours)
if cfg.get('preview'):
    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.display.shading.light = 'STUDIO'
    scene.display.shading.color_type = 'MATERIAL'
    scene.render.resolution_x, scene.render.resolution_y = 900, 520
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam'))
    scene.collection.objects.link(cam)
    scene.camera = cam
    for i, (x, y, z) in enumerate([(-5.5, -6.5, 2.2), (5.5, 6.5, 2.2)]):
        cam.location = (x, y, z)
        d = Vector((0, 0, 0.7)) - cam.location
        cam.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
        scene.render.filepath = f"{cfg['preview']}-{i}.png"
        bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(cam, do_unlink=True)

kw = dict(filepath=cfg['out'], export_format='GLB', export_apply=True, export_yup=True,
          export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6,
          export_cameras=False, use_selection=False)
try:
    bpy.ops.export_scene.gltf(export_lights=False, **kw)
except TypeError:
    bpy.ops.export_scene.gltf(**kw)
print('EXPORTED', cfg['out'])
