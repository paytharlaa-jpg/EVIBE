# Blender: print the channels of a Rocketbox animation FBX (debug).
import bpy, sys
path = sys.argv[sys.argv.index('--') + 1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=path)
for o in bpy.data.objects:
    print('OBJ', o.name, o.type, o.parent.name if o.parent else None, len(o.data.bones) if o.type == 'ARMATURE' else '')
for a in bpy.data.actions:
    fcs = []
    for layer in a.layers:
        for st in layer.strips:
            for cb in st.channelbags:
                fcs += list(cb.fcurves)
    paths = sorted({f.data_path for f in fcs})
    print('ACT', a.name, len(fcs), paths[:6])
    for f in fcs[:200]:
        if 'L_UpperArm' in f.data_path and 'rotation' in f.data_path:
            vals = [round(f.evaluate(fr), 3) for fr in (1, 50, 150)]
            print('  ', f.data_path, f.array_index, vals)
