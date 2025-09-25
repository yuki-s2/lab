export interface FrameChild {
  id: number;
  parent_id: number;
  parent_type: "template" | "child";
  name: string;
  content: string; // HTMLコンテンツ
  order_index: number;
  created_at?: string;
  updated_at?: string;

  // クライアントサイドでのみ使用（再帰的な子要素）
  children?: FrameChild[];
}

export interface CreateFrameChildParams {
  parent_id: number;
  parent_type: "template" | "child";
  name: string;
  content: string;
}

export interface UpdateFrameChildParams {
  id: number;
  name?: string;
  content?: string;
  order_index?: number;
}
