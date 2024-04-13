export interface PlayerProfileInfo {
    name: string
    age: number
    earnings: number
    profilePic: string | null
    gamesPlayed: number
    leaderboardRanking?: number
  }


export interface ProfilePicFile{
    length: number
    chunkSize: number
    fileName: string
    contentType: string
}

export interface ProfilePicChunk{
    n: number
    data: any
}