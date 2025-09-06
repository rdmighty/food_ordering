import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage, TablesDB } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    platform: 'com.jsm.foodordering',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
    categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_CATEGORIES_ID!,
    menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_MENUS_ID!,
    customizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_CUSTOMIZATIONS_ID!,
    menuCustomizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_MENU_CUSTOMIZATIONS_ID!,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!,
};

export const client = new Client();

client
.setEndpoint(appwriteConfig.endpoint)
.setProject(appwriteConfig.projectId)
.setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const tablesDB = new TablesDB(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password);
        if (!newAccount) {
            throw Error;
        }

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases
            .createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                { accountId: newAccount.$id, email, name, avatar: avatarUrl });
    } catch (error) {
        throw new Error(error as string)
    }
};

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
    } catch (error) {
        throw new Error(error as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases
            .listDocuments(
                appwriteConfig.databaseId, 
                appwriteConfig.userCollectionId,
                [Query.equal('accountId', currentAccount.$id)]);

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        throw new Error(error as string);
    }
};

export const getMenu = async ({ category, query } : GetMenuParams) => {
    try {
        const queries: string[] = [];
        if (category) {
            queries.push(Query.equal('categories', category));
        }

        if (query) {
            queries.push(Query.search('name', query));
        }

        const menus = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.menuCollectionId,
            queries,
        });

        return menus.rows;
    } catch (error) {
        throw new Error(error as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await tablesDB.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.categoriesCollectionId,        
        });

        return categories.rows;
    } catch (error) {
        throw new Error(error as string);
    }
}
