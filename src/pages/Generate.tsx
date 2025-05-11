import { Link } from "react-router-dom";
import Layout from "../layout/Layout";

const generate = () => {
  return (
    <Layout title="パーツを生成">
      <Link className="btn" to="/Assemble">
        パーツを生成
      </Link>
    </Layout>
  );
};

export default generate;
