import { adminDb } from "~/lib/firebaseAdmin.server";

export const deleteUserPosts = async (uid: string) => {
  const posts = adminDb.collection(`users/${uid}/posts`);
  const snapshot = await posts.get();
  if (snapshot.empty) {
    return;
  }

  const batch = adminDb.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
