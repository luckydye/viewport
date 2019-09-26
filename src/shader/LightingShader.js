import MeshShader from './MeshShader.js';
import DefaultShader from './DefaultShader.js';

export default class LightingShader extends DefaultShader {
    static defaultShading() {
        return `
            oFragColor = vec4(1.0);

            vec3 normal = getMappedValue(material.normalMap, vec4(vNormal, 1.0)).xyz;
            float specular = getMappedValue(material.specularMap, vec4(material.specular)).r;
            float roughness = getMappedValue(material.roughnessMap, vec4(material.roughness)).r;

            DiffuseShading(oFragColor, normal, ambientLight);
            Specular(oFragColor, normal, specular, roughness);
            Shadow(oFragColor, normal);
        `;
    }
}