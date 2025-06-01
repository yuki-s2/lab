import { Link } from "react-router-dom";
import Layout from "../layout/Layout";

const generate = () => {
  return (
    <Layout title="パーツを生成">
      <Link className="btn" to="/Assemble">
      組み立てる
      </Link>
      <div className="box">
        
      </div>
    </Layout>
  );
};

export default generate;
