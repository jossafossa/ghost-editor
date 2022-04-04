function unity_flip_anchor_point(anchor_point, tile_width, tile_height, flipX, flipY) {
    if (flipX == 1) {
        anchor_point[0] += tile_width - 1;
    } else if (flipX != 0) {
        console.error("Invalid flip X in toUnity")
    }

    if (flipY == 1) {
        anchor_point[1] += tile_height - 1;
    } else if (flipY != 0) {
        console.error("Invalid flip Y in toUnity")
    }

    return anchor_point;
}

function unity_flip_tile(tile_pos, tile_width, tile_height, flipX, flipY) {
    if (flipX == 1) {
        tile_pos[0] = (tile_width - 1) - tile_pos[0];
    } else if (flipX != 0) {
        console.error("Invalid flip X in toUnity")
    }

    if (flipY == 1) {
        tile_pos[1] = (tile_height - 1) - tile_pos[1];
    } else if (flipY != 0) {
        console.error("Invalid flip Y in toUnity")
    }

    return tile_pos
}

function unity_rotate_anchor_point(anchor_point, tile_width, tile_height, rotation_factor) {
    switch (rotation_factor % 4) {
        case 0:
            return anchor_point
            break;
        case 1:
            return [anchor_point[0] + (tile_height - 1), anchor_point[1]]
            break;
        case 2:
            return [anchor_point[0] + (tile_width - 1), anchor_point[1] + (tile_height - 1)]
            break;
        case 3:
            return [anchor_point[0], anchor_point[1] + (tile_width - 1)]
            break;
        default:
            console.error("Invalid rotation in toUnity");
            break;
    }

}

function unity_rotate_tile(relative_coord, rotation_factor) {
    switch (rotation_factor % 4) {
        case 0:
            return relative_coord;
            break;
        case 1:
            return [-Math.abs(relative_coord[1]), Math.abs(relative_coord[0])]
            break;
        case 2:
            return [-Math.abs(relative_coord[0]), -Math.abs(relative_coord[1])]
            break;
        case 3:
            return [relative_coord[1], -Math.abs(relative_coord[0])]
            break;
        default:
            console.error("Invalid rotation in toUnity");
            break;
    }
}

function unity_transform_tilesprite(tilesprite, width, height, tile_ids, name) {
    let anchor_point = unity_rotate_anchor_point([tilesprite.x, tilesprite.y], width, height, tilesprite.rotation);
    let tile_idx = 0;
    let output = "";
    let nulls_seen = 0;
    for (let y = 0; y != height; y++) {
        for (let x = 0; x != width; x++) {
            let tile_id = tile_ids[tile_idx];
            tile_idx++;
            if (tile_id === null) {
                nulls_seen++;
                continue;
            }
            let relative_tile_pos = [x, y];
            relative_tile_pos = unity_flip_tile(relative_tile_pos, width, height, tilesprite.flipX, tilesprite.flipY);
            relative_tile_pos = unity_rotate_tile(relative_tile_pos, tilesprite.rotation);

            let current_rot = tilesprite.rotation;
            if (tilesprite.rotation % 2 == 1 && ((tilesprite.flipX && !tilesprite.flipY) || ((!tilesprite.flipX && tilesprite.flipY)))) current_rot = (current_rot + 2) % 4;
            relative_tile_pos[0] += anchor_point[0];
            relative_tile_pos[1] += anchor_point[1];
            let name_id;
            if (height === 1 && width === 1) {
                name_id = `${name}`;
            } else {
                name_id = `${name}_${tile_idx - 1 - nulls_seen}`;
            }
            output += `${relative_tile_pos[0]} ${-1 * relative_tile_pos[1]} ${current_rot} ${tilesprite.flipX ? 1 : 0} ${tilesprite.flipY ? 1 : 0} ${tilesprite.layer} ${name_id}\n`
        }
    }
    return output;
}


export default function toUnity(value, tiles) {
    let output = "";
    for (let tile of value) {
        let { x, y, rotation, flipX, flipY, layer, id } = tile;
        let { name, image, width, height, ids } = tiles[id];
        output += unity_transform_tilesprite(tile, width, height, ids, name);
    }
    return output;
}