import pkg from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "~/lib/firebaseAdmin.server";
import type { Post, PostWithMetadata } from "./schema";
const firestore = pkg.firestore;

export const createPost = async (data: Post, uid: string) => {
  const stamp = firestore.FieldValue.serverTimestamp();

  const res = await adminDb
    .collection("users")
    .doc(uid)
    .collection("posts")
    .add({
      ...data,
      contentEmbeddings:
        data.contentEmbeddings &&
        firestore.FieldValue.vector(data.contentEmbeddings),
      userId: uid,
      createdAt: stamp,
      timestamp: stamp,
    });

  const createdDoc = await res.get();
  const date = createdDoc.get("createdAt") as Timestamp;
  const timestamp = createdDoc.get("timestamp") as Timestamp;

  return {
    ...(createdDoc.data() as Post),
    id: res.id,
    createdAt: date.toDate().getTime(),
    timestamp: timestamp.toDate().getTime(),
  } as PostWithMetadata;
};

export const getPostById = async (
  uid: string,
  postId: string
): Promise<PostWithMetadata | null> => {
  const postRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("posts")
    .doc(postId);
  const post = await postRef.get();
  if (!post.exists) {
    return null;
  }
  const data = post.data();
  const date = data?.createdAt as Timestamp;
  const timestamp = data?.timestamp as Timestamp;

  return {
    ...(data as Post),
    id: post.id,
    createdAt: date.toDate().getTime(),
    timestamp: timestamp.toDate().getTime(),
  } as PostWithMetadata;
};

export const getPosts = async (
  uid: string,
  limit: number = 10,
  offset: number = 0
): Promise<PostWithMetadata[]> => {
  const snapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("posts")
    .orderBy("createdAt", "desc") // createdAtで降順
    .limit(limit)
    .offset(offset)
    .get();

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    const date = data.createdAt as Timestamp;
    const stamp = data.timestamp as Timestamp;
    return {
      ...(data as Post),
      id: doc.id,
      createdAt: date.toDate().getTime(),
      timestamp: stamp.toDate().getTime(),
    };
  });

  return posts;
};

export const getPostsByTimeRange = async (
  uid: string,
  oldestDate: Date,
  limit: number = 100
): Promise<PostWithMetadata[]> => {
  const timestamp = Timestamp.fromDate(oldestDate);
  const snapshot = await adminDb
    .collection("users")
    .doc(uid)
    .collection("posts")
    .orderBy("timestamp", "desc")
    .endBefore(timestamp)
    .limit(limit)
    .get();

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    const date = data.createdAt as Timestamp;
    const stamp = data.timestamp as Timestamp;
    return {
      ...(data as Post),
      id: doc.id,
      createdAt: date.toDate().getTime(),
      timestamp: stamp.toDate().getTime(),
    };
  });

  return posts;
};

export const updatePost = async (
  uid: string,
  postId: string,
  data: Partial<Post>
): Promise<PostWithMetadata> => {
  const postRef = adminDb
    .collection("users")
    .doc(uid)
    .collection("posts")
    .doc(postId);
  await postRef.update(data);
  const post = await postRef.get();
  const date = post.get("createdAt") as Timestamp;
  return {
    ...(post.data() as Post),
    id: post.id,
    createdAt: date.toDate().getTime(),
  } as PostWithMetadata;
};

export const deletePost = async (uid: string, postId: string) => {
  await adminDb
    .collection("users")
    .doc(uid)
    .collection("posts")
    .doc(postId)
    .delete();
};

export const findPostBySimilarity = async (uid: string, vec: number[]) => {
  const snapshot = await adminDb
    .collectionGroup("posts")
    .where("userId", "==", uid)
    .findNearest({
      queryVector: vec,
      vectorField: "contentEmbeddings",
      distanceMeasure: "COSINE",
      limit: 3,
    })
    .get();

  const posts = snapshot.docs.map((doc) => {
    const data = doc.data();
    const date = data.createdAt as Timestamp;
    const stamp = data.timestamp as Timestamp;
    return {
      ...(data as Post),
      id: doc.id,
      createdAt: date.toDate().getTime(),
      timestamp: stamp.toDate().getTime(),
    };
  });

  return posts;
};
