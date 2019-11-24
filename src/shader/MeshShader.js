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
                vec2 attributes;
            };
        `;
    }

    static get structSceneProjection() {
        return `
            struct SceneProjection {
                mat4 model;
                mat4 projectionView;
            };
        `;
    }

    static shaderVertexHeader(str = "") {
        return `#version 300 es
            
            precision mediump float;
            precision mediump int;
            
            layout(location = 0) in vec3 aPosition;
            layout(location = 1) in vec3 aTexCoords;
            layout(location = 2) in vec3 aNormal;

            ${MeshShader.structSceneProjection}
        
            out vec2 vTexCoords;
            out vec4 vWorldPos;
            out vec4 vTexelPos;
            out vec3 vViewPos;
            out vec3 vNormal;
            out vec3 vVertexPos;
            out vec3 primitiveColor;
            out float index;
            flat out int materialIndex;

            ${str}
        `;
    }

    static shaderFragmentHeader(strings, ...raw) {
        let string = "";

        for(let i = 0; i < strings.length; i++) {
            string += strings[i] || "";
            string += raw[i] || "";
        }

        return `#version 300 es

            precision mediump float;
            precision mediump int;

            in vec2 vTexCoords;
            in vec4 vTexelPos;
            in vec4 vWorldPos;
            in vec3 vViewPos;
            in vec3 vNormal;
            in vec3 vVertexPos;
            in vec3 primitiveColor;
            in float index;
            flat in int materialIndex;

            ${MeshShader.structMaterial}
        
            out vec4 oFragColor;

            ${string}
        `;
    }

    static vertexSource() {
        return MeshShader.shaderVertexHeader`
        
        uniform SceneProjection scene;

        uniform float objectIndex;
        
        uniform vec3 cameraPosition;
        
        void main() {
            vec4 pos = scene.model * vec4(aPosition, 1.0);
        
            gl_Position = scene.projectionView * pos;
            gl_PointSize = 2.0;

            // set vert outputs
            vTexCoords = vec2(aTexCoords.x, aTexCoords.y);
            materialIndex = int(aTexCoords.z);
            vViewPos = cameraPosition.xyz;
            vVertexPos = aPosition;
            vWorldPos = pos;
            vNormal = normalize(vec4(aNormal, 0.0) * inverse(scene.model)).xyz;
            primitiveColor = aNormal;
            index = objectIndex;
            vTexelPos = gl_Position;
        }`;
    }

    static fragmentSource() {
        return MeshShader.shaderFragmentHeader`
            void main() {
                oFragColor = vec4(0.0, 1.0, 1.0, 1.0);
            }
        `;
    }
}
