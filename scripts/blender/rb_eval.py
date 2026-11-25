# Blender: apply an animation FBX to an avatar and print a few evaluated bone rotations (debug).
import bpy, sys
av, an = sys.argv[sys.argv.index('--') + 1:][:2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=av)
arm = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
before = set(bpy.data.objects)
bpy.ops.import_scene.fbx(filepath=an)
src = next(o for o in bpy.data.objects if o not in before and o.type == 'ARMATURE')
act = src.animation_data.action
print('SRC bones', len(src.data.bones), 'AV bones', len(arm.data.bones))
print('SRC names', [b.name for b in src.data.bones][:10])
print('AV  names', [b.name for b in arm.data.bones][:10])
fcs = [f for l in act.layers for s in l.strips for cb in s.channelbags for f in cb.fcurves]
for f in fcs:
    if f.data_path.startswith('pose.bones["Bip01 L Thigh"]') or f.data_path.startswith('pose.bones["Bip01 Pelvis"].loc'):
        print(f.data_path, f.array_index, [round(f.evaluate(fr), 3) for fr in (1, 60, 200)], len(f.keyframe_points))
missing = sorted({f.data_path.split('"')[1] for f in fcs if f.data_path.startswith('pose.bones')} - {b.name for b in arm.data.bones})
print('MISSING in avatar', missing[:10], len(missing))
