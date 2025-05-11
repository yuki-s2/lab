interface Props {
    title: string;
    children: React.ReactNode;
}

const Layout = ({ children, title }: Props) => {
  return (
    <main>
      <h1>{title}</h1>
      <div className="inner">{children}</div>
    </main>
  );
};

export default Layout;
