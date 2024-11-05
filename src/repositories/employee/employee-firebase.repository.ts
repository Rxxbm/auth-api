import { Repository } from "../../common/protocols/repository";
import { Employee } from "../../entities/employee";
import { firestore } from "../../config/firebase"; // Importe sua configuração do Firestore

export class EmployeeFirestoreRepository implements Repository<Employee> {
  private collection = firestore.collection("employees"); // Supondo que a coleção seja 'employees'

  public async create(account: Partial<Employee>): Promise<Employee> {
    const id = this.collection.doc().id;
    account.id = id;
    account.created_at = new Date();
    account.updated_at = new Date();
    const docRef = await this.collection.add(account);
    return { id: docRef.id, ...account } as Employee; // Retorna o documento com o ID gerado
  }

  public async list(): Promise<Employee[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Employee)
    );
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  async findById(id: string): Promise<Employee | null> {
    const doc = await this.collection.doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Employee) : null;
  }

  async findByAuthId(authId: string): Promise<Employee | undefined> {
    const snapshot = await this.collection.where("auth_id", "==", authId).get();
    return snapshot.empty
      ? undefined
      : ({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Employee);
  }

  async update(id: string, data: Partial<Employee>): Promise<Employee | null> {
    const docRef = this.collection.doc(id);
    await docRef.update(data);
    const updatedDoc = await docRef.get();
    return updatedDoc.exists
      ? ({ id: updatedDoc.id, ...updatedDoc.data() } as Employee)
      : null;
  }
}

export interface EmployeeRepository extends Repository<Employee> {
  findByAuthId(authId: string): Promise<Employee | undefined>;
}

export const employeeFirebaseRepo = new EmployeeFirestoreRepository();
