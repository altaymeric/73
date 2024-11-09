export interface Payment {
  id: string;
  dueDate: Date;
  checkNumber: string;
  bank: string;
  company: string;
  businessGroup: string;
  description: string;
  amount: number;
  status: 'pending' | 'paid';
}