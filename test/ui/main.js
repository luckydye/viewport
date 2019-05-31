import Test from "../../src/Test";
import { Geometry } from "../../src/scene/Geometry";
import { Resources } from "../../src/Resources";
import { Loader } from "../../src/Loader";
import { Animation } from "../../src/Animation";
import { Pointlight } from "../../src/light/Pointlight";
import { Vec } from "../../src/Math";
import DefaultMaterial from "../../src/materials/DefaultMaterial";

const resources = {
    'desk': require('../../res/models/desk_exploded.obj'),
}

Test.viewportTest(resources, viewport => {

    const scene = viewport.scene;

    viewport.renderer.background = [0.8, 0.9, 1.0, 1.0];

    const meshVerts = Loader.loadObjFile(Resources.get('desk'));
    const mesh = new Geometry({
        vertecies: meshVerts,
        material: new DefaultMaterial(),
        scale: 50,
        id: 10,
    });
    scene.add(mesh);

    const lights = [
        new Pointlight({
            color: [0, 0.4, 1],
            id: 10,
        }),
        new Pointlight({
            color: [1, 0, 0],
            id: 20,
        }),
    ]

    {
        const anim = new Animation(lights[1], 'position', 10000, true);
        anim.setKeyframes([
            new Vec(550, 903, 197),
            new Vec(450, 903 + 25, 197),
            new Vec(550, 903, 197),
        ]);
        viewport.scheduler.addTask(anim);
    }

    scene.add(lights);
});
