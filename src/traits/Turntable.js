import { Vec } from '../Math';
import Input from '../Input';

export default  {

    onCreate(entity) {
        Input.init();

        let x = 0;
        const dist = -32;

        let lastX = 0;

        Input.onDrag(e => {
            if(e.button == 2) {
                if(e.first) {
                    lastX = e.x;
                }

                x += (e.x - lastX) / 200;

                lastX = e.x;
    
                entity.position.x = Math.sin(-x) * dist;
                entity.position.z = Math.cos(-x) * dist;
                entity.rotation.y = x;
            }
        });

        entity.position.x = Math.sin(-x) * dist;
        entity.position.z = Math.cos(-x) * dist;
        entity.rotation.y = x;
    },

}
