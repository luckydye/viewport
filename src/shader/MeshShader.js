import { Shader } from '../renderer/RendererShader.js';

export default class MeshShader extends Shader {

    static get structMaterial() {
        return `
            struct Material {
                sampler2D texture;
                sampler2D specularMap;
                sampler2D normalMap;
                sampler2D displacementMap;
                sampler2D roughnessMap;
                vec4 diffuseColor;
                float specular;
                float roughness;
                float transparency;
                float textureScale;
                bool scaleUniform;
            };
        `;
    }

    static get structSceneProjection() {
        return `
            struct SceneProjection {
                mat4 model;
                mat4 view;
                mat4 projection;
            };
        `;
    }

    static shaderVertexHeader(str = "") {
        return `#version 300 es
            
            precision mediump float;
            
            layout(std140, column_major) uniform;
            
            layout(location = 0) in vec3 aPosition;
            layout(location = 1) in vec2 aTexCoords;
            layout(location = 2) in vec3 aNormal;

            ${MeshShader.structSceneProjection}
            ${MeshShader.structMaterial}
        
            out vec2 vTexCoords;
            out vec4 vWorldPos;
            out vec4 vTexelPos;
            out vec3 vViewPos;
            out vec3 vNormal;
            out vec3 vVertexPos;
            out vec3 primitiveColor;

            ${str}
        `;
    }

    static shaderFragmentHeader(str = "") {
        return `#version 300 es

            precision mediump float;

            in vec2 vTexCoords;
            in vec4 vTexelPos;
            in vec4 vWorldPos;
            in vec3 vViewPos;
            in vec3 vNormal;
            in vec3 vVertexPos;
            in vec3 primitiveColor;

            ${MeshShader.structSceneProjection}
            ${MeshShader.structMaterial}
        
            out vec4 oFragColor;

            ${str}
        `;
    }

    static vertexSource() {
        return MeshShader.shaderVertexHeader`
        
        uniform SceneProjection scene;
        uniform Material material;
        
        uniform vec4 cameraPosition;

        uniform float time;
        
        void main() {
            // uniformSacle
            float uniformSacle = 1.0;
            if(material.scaleUniform) {
                uniformSacle = (scene.projection * scene.view * scene.model * vec4(aPosition, 1.0)).z;
            }

            // texture coords
            if(material.textureScale > 0.0) {
                vec2 imageSize = vec2(textureSize(material.texture, 0));
                float scale = (imageSize.x / material.textureScale);
                vTexCoords = aTexCoords / scale;
            } else {
                vTexCoords = aTexCoords;
            }

            // displacement
            vec2 displace = texture(material.displacementMap, vTexCoords).rg;
            vTexCoords += (displace.xy);
        
            vec4 pos = scene.model * vec4(aPosition * uniformSacle, 1.0);
            
            // deform
            // float bump = texture(material.displacementMap, vTexCoords).r * 10.0;
            // pos += vec4(aNormal.xyz, 1.0) * bump;

            // set vert outputs
            vViewPos = -cameraPosition.xyz;
            vVertexPos = aPosition;
            vWorldPos = pos;
            vNormal = (vec4(aNormal, 0.0) * inverse(scene.model)).xyz;
            primitiveColor = aNormal;
        
            gl_Position = scene.projection * scene.view * vec4(pos.xyz, 1.0);
            gl_PointSize = 5.0;

            vTexelPos = gl_Position;
        }`;
    }

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main() {
                oFragColor = vec4(1.0, 0.0, 1.0, 1.0);
            }
        `;
    }
}
