# Blender: list objects, materials, modifiers and triangle counts of a .blend
# Usage: blender -b file.blend --python inspect.py
import bpy

deps = bpy.context.evaluated_depsgraph_get()
total = 0
print("=== OBJECTS ===")
for o in bpy.data.objects:
    tris = 0
    if o.type == 'MESH':
        ev = o.evaluated_get(deps)
        me = ev.to_mesh()
        tris = sum(len(p.vertices) - 2 for p in me.polygons)
        ev.to_mesh_clear()
        total += tris
    mats = [s.material.name for s in getattr(o, 'material_slots', []) if s.material]
    mods = [m.type for m in getattr(o, 'modifiers', [])]
    dims = tuple(round(d, 2) for d in o.dimensions)
    loc = tuple(round(v, 2) for v in o.matrix_world.translation)
    print(f"OBJ|{o.name}|{o.type}|tris={tris}|parent={o.parent.name if o.parent else ''}|hide={o.hide_render}|dims={dims}|loc={loc}|mods={mods}|mats={mats[:6]}")
print("TOTAL_TRIS", total)
print("=== MATERIALS ===")
for m in bpy.data.materials:
    info = ''
    if m.use_nodes:
        types = sorted({n.type for n in m.node_tree.nodes})
        info = ','.join(types)
        bsdf = next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if bsdf:
            c = bsdf.inputs['Base Color'].default_value
            info += f" base=({c[0]:.2f},{c[1]:.2f},{c[2]:.2f}) metal={bsdf.inputs['Metallic'].default_value:.2f} rough={bsdf.inputs['Roughness'].default_value:.2f}"
    else:
        c = m.diffuse_color
        info = f"diffuse=({c[0]:.2f},{c[1]:.2f},{c[2]:.2f})"
    print(f"MAT|{m.name}|users={m.users}|{info}")
print("RENDER", bpy.context.scene.render.engine)
