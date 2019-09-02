import { Shader } from '../renderer/RendererShader.js';

export default class MeshShader extends Shader {

    static vertexSource() {
        return `#version 300 es
        
        precision mediump float;
        
        #define POINT_SIZE 5.0;
        
        layout(std140, column_major) uniform;
        
        layout(location = 0) in vec3 aPosition;
        layout(location = 1) in vec2 aTexCoords;
        layout(location = 2) in vec3 aNormal;
        
        struct SceneProjection {
            mat4 model;
            mat4 view;
            mat4 projection;
        };
        uniform SceneProjection scene;
        
        struct Material {
            sampler2D texture;
            sampler2D specularMap;
            sampler2D normalMap;
            sampler2D displacementMap;
            vec4 diffuseColor;
            float specular;
            float roughness;
            float metallic;
            float transparency;
            float textureScale;
            bool scaleUniform;
            bool selected;
        };
        uniform Material material;
        
        uniform mat4 lightProjViewMatrix;

        uniform float time;
        
        out SceneProjection sceneProjection;
        out vec2 vTexCoords;
        out vec4 vWorldPos;
        out vec4 vTexelPos;
        out vec3 vNormal;
        out vec3 vertexPos;
        out vec3 primitiveColor;
        out float id;
        
        void main() {
            float uniformSacle = 1.0;
            if(material.scaleUniform) {
                uniformSacle = (scene.projection * scene.view * scene.model * vec4(aPosition, 1.0)).z;
            }
        
            vec4 pos = scene.model * vec4(aPosition * uniformSacle, 1.0);
        
            float bump = texture(material.displacementMap, aTexCoords).r * 200.0;
        
            float xbump = bump * aNormal.x;
            float ybump = bump * (aNormal.y-1.0 * -1.0);
            float zbump = bump * aNormal.z;
        
            gl_Position = scene.projection * scene.view * vec4(pos.x + xbump, pos.y + ybump, pos.z + zbump, 1.0);
            gl_PointSize = 5.0;

            gl_Position.y -= sin(time * 0.0005 + gl_Position.z) * 0.5;
        
            vertexPos = aPosition;
            vWorldPos = pos;
            vTexelPos = gl_Position;
            vNormal = (vec4(aNormal, 1.0) * scene.model).xyz;
            vTexCoords = aTexCoords;
            primitiveColor = aNormal;
            sceneProjection = scene;
        }`;
    }

    static fragmentSource() {
        return `#version 300 es

        precision mediump float;
        
        out vec4 oFragColor;
        
        void main() {
            oFragColor = vec4(1.0, 0.0, 1.0, 1.0);
        }`;
    }
}
