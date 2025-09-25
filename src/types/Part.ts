export interface Part {
  id: number;
  name: string;
  frame: string;
  frame_id: number;
  selected_children_ids: number[]; // 選択された子要素のID配列
  order_index: number;
  uid: string;
  created_at?: string;
  updated_at?: string;
}
