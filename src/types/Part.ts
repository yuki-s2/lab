export interface Part {
  id: number;
  name: string;
  content: string | null;
  frame: string;
  frame_id: number;
  order_index: number;
  uid: string;
  created_at?: string;
  updated_at?: string;
}
