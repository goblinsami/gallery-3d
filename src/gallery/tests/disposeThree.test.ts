import { BoxGeometry, Group, Mesh, MeshStandardMaterial, Texture } from "three";
import { describe, expect, it, vi } from "vitest";
import { disposeThree } from "../engine/disposeThree";

describe("disposeThree", () => {
  it("disposes geometry, material and map texture", () => {
    const geometry = new BoxGeometry();
    const texture = new Texture();
    const material = new MeshStandardMaterial({ map: texture });

    const geometryDisposeSpy = vi.spyOn(geometry, "dispose");
    const materialDisposeSpy = vi.spyOn(material, "dispose");
    const textureDisposeSpy = vi.spyOn(texture, "dispose");

    const mesh = new Mesh(geometry, material);
    const root = new Group();
    root.add(mesh);

    disposeThree(root);

    expect(geometryDisposeSpy).toHaveBeenCalledTimes(1);
    expect(materialDisposeSpy).toHaveBeenCalledTimes(1);
    expect(textureDisposeSpy).toHaveBeenCalledTimes(1);
  });
});

