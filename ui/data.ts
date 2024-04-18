export interface PlayerProfileInfo {
    name: string
    age: number
    bio: string
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