import { firestore } from "../../config/firebase";
import { Repository } from "../../common/protocols/repository";
import { Auth } from "../../entities/authentication";

const authCollection = firestore.collection("auth");

export class AuthFirebaseRepository implements Repository<Auth> {
  public async create(account: any): Promise<Auth> {
    const docRef = authCollection.doc();
    account.id = docRef.id;
    account.created_at = new Date();
    account.updated_at = new Date();
    await docRef.set(account);
    return account;
  }

  public async findByEmail(email: string): Promise<Auth | undefined> {
    const snapshot = await authCollection.where("email", "==", email).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[0].data() as Auth;
  }

  public async list(): Promise<Auth[]> {
    const snapshot = await authCollection.get();
    return snapshot.docs.map((doc) => doc.data() as Auth);
  }

  public async delete(id: string): Promise<void> {
    await authCollection.doc(id).delete();
  }

  public async findById(id: string): Promise<Auth | null> {
    const doc = await authCollection.doc(id).get();
    return doc.exists ? (doc.data() as Auth) : null;
  }

  public async update(id: string, data: Partial<Auth>): Promise<Auth | null> {
    const doc = await authCollection.doc(id).get();
    if (!doc.exists) return null;

    const updatedData = { ...doc.data(), ...data, updated_at: new Date() };
    await authCollection.doc(id).update(updatedData);
    return updatedData as Auth;
  }
}

export const authFirebaseRepo = new AuthFirebaseRepository();
