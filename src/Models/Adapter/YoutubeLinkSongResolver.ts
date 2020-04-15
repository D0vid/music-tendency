import { ISongResolver } from "./ISongResolver";
import { Song } from "../Song";
import { NoMusicFound } from "../../Exceptions/NoMusicFoundError";
import { YoutubeFileStreamProvider } from "../Providers/YoutubeFileStreamProvider";
import { Command } from "../Command";
const ytpl = require('ytpl');
const ytdl = require('ytdl-core');

export class YoutubeSongResolver implements ISongResolver{

    async ResolveUri(uri: String, command: Command): Promise<Song[]>{
        let songList : Song[] = new Array<Song>();

        let isPlaylist : boolean =  ytpl.validateURL(uri);
        if(isPlaylist){
            let playlistId = uri?.match(/(.+list=)([^&]+)/)[2];
            const playlistInfo = await ytpl(playlistId);
            const playlistItems = playlistInfo['items'];

            for(let playlistItemId in playlistItems){
                let item : { title: String; url_simple: String; duration:string } = playlistItems[playlistItemId];
                let song = new Song(item.url_simple,item.title,item.duration, command?.Sender , new YoutubeFileStreamProvider());
                songList.push(song);
            }

        }else{
            let urlIsValid = ytdl.validateURL(uri);
            if(urlIsValid){
                const songInfo = await ytdl.getInfo(uri);
                let song = new Song(songInfo.video_url,songInfo.title,songInfo.length_seconds, command?.Sender , new YoutubeFileStreamProvider());
                songList.push(song);
            }
        }
        return songList;
    }

}