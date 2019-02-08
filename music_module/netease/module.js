const jar = require("request").jar();
const rp = require("request-promise").defaults({ jar });
const request = require("request").defaults({ jar });

const config = require(__dirname + "/../../config.json").Netease2; // 設定
const server = config.server || "http://localhost:4000/";

const { options, normalOptions } = require(__dirname + "/request");

function getRes(songRes) { // 歌曲解析度
    return { low: 128000, medium: 192000, high: 320000, original: 320000 }[songRes]
}

async function getSong(req, res, id) {
    const br = getRes(res);
    const isArray = Array.isArray(id);

    id = isArray ? id : [id];
    let result = await Promise.all(
        (await getSongsUrl(id, br)).map(async x => request(await normalOptions(x.url, req)))
    );
    return isArray ? result : result[0];
}

async function getSongsUrl(songs, br = 999000) {
    let isArray = Array.isArray(songs);
    songs = isArray ? songs : [songs];
    let result = await rp(options(`${server}song/url?br=${br}&id=${songs.join()}`));
    return isArray ? result.data : result.data[0];
}

