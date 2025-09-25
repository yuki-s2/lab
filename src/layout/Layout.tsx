interface Props {
  page?: string;
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main>
      <div className="inner">
        {children}
      </div>
    </main>
  );
};

export default Layout;
