export type ArticleItem = {
    id?: string;
    name: string;
    description: string;
    url: string;
    imageUrl?: string;
    updatedAt?: Date;
    createdAt?: Date;
    progress?: number;
    content?: string;
}
