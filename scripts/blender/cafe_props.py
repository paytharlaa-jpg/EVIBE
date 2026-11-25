# Blender: pack the Poly Haven (CC0) café props into one web-ready GLB.
# Each prop sits under an empty named after its asset id, at the origin, on the floor.
# Usage: blender -b --python cafe_props.py -- <src dir> <out.glb> [tex size]
import bpy, sys, os
from mathutils import Vector

src, out = sys.argv[sys.argv.index('--') + 1:][:2]
tex = int((sys.argv[sys.argv.index('--') + 1:] + ['512'])[2])
MAX_TRIS = 24000
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

for name in sorted(os.listdir(src)):
    d = os.path.join(src, name)
    gl = next((f for f in os.listdir(d) if f.endswith('.gltf')), None)
    if not gl:
        continue
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=os.path.join(d, gl))
    new = [o for o in bpy.data.objects if o not in before]
    meshes = [o for o in new if o.type == 'MESH']
    # world-space bounds
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    tris = 0
    for o in meshes:
        tris += sum(len(p.vertices) - 2 for p in o.data.polygons)
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c)
            lo = Vector(map(min, lo, w))
            hi = Vector(map(max, hi, w))
    # decimate heavy props (plants)
    if tris > MAX_TRIS:
        r = MAX_TRIS / tris
        for o in meshes:
            m = o.modifiers.new('dec', 'DECIMATE')
            m.ratio = r
            bpy.context.view_layer.objects.active = o
            for s in bpy.context.selected_objects:
                s.select_set(False)
            o.select_set(True)
            bpy.ops.object.modifier_apply(modifier='dec')
    root = bpy.data.objects.new(name, None)
    scene.collection.objects.link(root)
    centre = Vector(((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, lo.z))
    for o in new:
        if o.parent is None:
            mw = o.matrix_world.copy()
            o.parent = root
            o.matrix_world = mw
            o.location -= centre
    size = hi - lo
    print('PROP', name, 'tris', tris, 'size', tuple(round(v, 3) for v in size))

for img in bpy.data.images:
    if img.size[0] > tex:
        img.scale(tex, tex)

bpy.ops.export_scene.gltf(
    filepath=out,
    export_format='GLB',
    export_image_format='WEBP',
    export_image_quality=80,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=7,
    export_animations=False,
)
print('WROTE', out, os.path.getsize(out))
