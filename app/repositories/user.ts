import { adminDb } from "~/lib/firebaseAdmin.server";

export const deleteUserPosts = async (uid: string) => {
  const posts = adminDb.collection(`users/${uid}/posts`);
  const snapshot = await posts.get();
  if (snapshot.empty) {
    console.log("No matching documents.");
    return;
  }

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => {
    console.log("Deleting post: ", doc.id);
    batch.delete(doc.ref);
  });

  await batch.commit();
};
