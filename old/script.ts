import type { SetActivity } from "@xhayper/discord-rpc/dist/structures/ClientUser";
import type { GatewayActivityButton } from "discord-api-types/v10";

import { Client as DiscordClient } from "@xhayper/discord-rpc";

const clientId = "1177081335727267940";

export type DiscordPluginConfig = {
  enabled: boolean;
  /**
   * If enabled, will try to reconnect to discord every 5 seconds after disconnecting or failing to connect
   *
   * @default true
   */
  autoReconnect: boolean;
  /**
   * If enabled, the discord rich presence gets cleared when music paused after the time specified below
   */
  activityTimeoutEnabled: boolean;
  /**
   * The time in milliseconds after which the discord rich presence gets cleared when music paused
   *
   * @default 10 * 60 * 1000 (10 minutes)
   */
  activityTimeoutTime: number;
  /**
   * Add a "Play on YouTube Music" button to rich presence
   */
  playOnYouTubeMusic: boolean;
  /**
   * Hide the "View App On GitHub" button in the rich presence
   */
  hideGitHubButton: boolean;
  /**
   * Hide the "duration left" in the rich presence
   */
  hideDurationLeft: boolean;
};

const config = {
  enabled: false,
  autoReconnect: true,
  activityTimeoutEnabled: true,
  activityTimeoutTime: 10 * 60 * 1000,
  playOnYouTubeMusic: true,
  hideGitHubButton: false,
  hideDurationLeft: false,
};

export enum MediaType {
  /**
   * Audio uploaded by the original artist
   */
  Audio = "AUDIO",
  /**
   * Official music video uploaded by the original artist
   */
  OriginalMusicVideo = "ORIGINAL_MUSIC_VIDEO",
  /**
   * Normal YouTube video uploaded by a user
   */
  UserGeneratedContent = "USER_GENERATED_CONTENT",
  /**
   * Podcast episode
   */
  PodcastEpisode = "PODCAST_EPISODE",
  OtherVideo = "OTHER_VIDEO",
}

export interface Info {
  rpc: DiscordClient;
  ready: boolean;
  autoReconnect: boolean;
  lastSongInfo?: SongInfo;
}

export interface SongInfo {
  title: string;
  artist: string;
  views: number;
  uploadDate?: string;
  imageSrc?: string | null;
  image?: string | null;
  isPaused?: boolean;
  songDuration: number;
  elapsedSeconds?: number;
  url?: string;
  album?: string | null;
  videoId: string;
  playlistId?: string;
  mediaType: MediaType;
}

const songInfo: SongInfo = {
  title: "test3",
  artist: "",
  views: 0,
  uploadDate: "",
  imageSrc: "",
  image: null,
  isPaused: undefined,
  songDuration: 0,
  elapsedSeconds: 0,
  url: "",
  album: undefined,
  videoId: "",
  playlistId: "",
  mediaType: MediaType.Audio,
} satisfies SongInfo;

export interface Info {
  rpc: DiscordClient;
  ready: boolean;
  autoReconnect: boolean;
}

const info: Info = {
  rpc: new DiscordClient({
    clientId,
  }),
  ready: false,
  autoReconnect: true,
};

let clearActivity: NodeJS.Timeout | undefined;

export const clear = () => {
  if (info.rpc) {
    info.rpc.user?.clearActivity();
  }

  clearTimeout(clearActivity);
};

function updateActivity(songInfo: SongInfo, config: DiscordPluginConfig) {
  if (songInfo.title.length === 0 && songInfo.artist.length === 0) {
    return;
  }

  info.lastSongInfo = songInfo;

  // Stop the clear activity timeout
  clearTimeout(clearActivity);

  // Stop early if discord connection is not ready
  // do this after clearTimeout to avoid unexpected clears
  if (!info.rpc || !info.ready) {
    return;
  }

  // Clear directly if timeout is 0
  if (
    songInfo.isPaused &&
    config.activityTimeoutEnabled &&
    config.activityTimeoutTime === 0
  ) {
    info.rpc.user?.clearActivity().catch(console.error);
    return;
  }

  // Song information changed, so lets update the rich presence
  // @see https://discord.com/developers/docs/topics/gateway#activity-object
  // not all options are transfered through https://github.com/discordjs/RPC/blob/6f83d8d812c87cb7ae22064acd132600407d7d05/src/client.js#L518-530
  const hangulFillerUnicodeCharacter = "\u3164"; // This is an empty character
  if (songInfo.title.length < 2) {
    songInfo.title += hangulFillerUnicodeCharacter.repeat(
      2 - songInfo.title.length
    );
  }
  if (songInfo.artist.length < 2) {
    songInfo.artist += hangulFillerUnicodeCharacter.repeat(
      2 - songInfo.title.length
    );
  }

  // see https://github.com/th-ch/youtube-music/issues/1664
  let buttons: GatewayActivityButton[] | undefined = [];
  if (config.playOnYouTubeMusic) {
    buttons.push({
      label: "Play on YouTube Music",
      url: songInfo.url ?? "https://music.youtube.com",
    });
  }
  if (!config.hideGitHubButton) {
    buttons.push({
      label: "View App On GitHub",
      url: "https://github.com/th-ch/youtube-music",
    });
  }
  if (buttons.length === 0) {
    buttons = undefined;
  }

  const activityInfo: SetActivity = {
    details: songInfo.title,
    state: songInfo.artist,
    largeImageKey: songInfo.imageSrc ?? "",
    largeImageText: songInfo.album ?? "",
    buttons,
  };

  if (songInfo.isPaused) {
    // Add a paused icon to show that the song is paused
    activityInfo.smallImageKey = "paused";
    activityInfo.smallImageText = "Paused";
    // Set start the timer so the activity gets cleared after a while if enabled
    if (config.activityTimeoutEnabled) {
      clearActivity = setTimeout(
        () => info.rpc.user?.clearActivity().catch(console.error),
        config.activityTimeoutTime ?? 10_000
      );
    }
  } else if (!config.hideDurationLeft) {
    // Add the start and end time of the song
    const songStartTime = Date.now() - (songInfo.elapsedSeconds ?? 0) * 1000;
    activityInfo.startTimestamp = songStartTime;
    activityInfo.endTimestamp = songStartTime + songInfo.songDuration * 1000;
  }

  info.rpc.user?.setActivity(activityInfo).catch(console.error);
};

updateActivity(songInfo, config);
