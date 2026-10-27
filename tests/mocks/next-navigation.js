const router = {
  push() {},
  replace() {},
  refresh() {},
  back() {},
  forward() {},
  prefetch() {},
};

const navegacion = {
  useRouter: () => router,
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
};

module.exports = navegacion;
module.exports.default = navegacion;
module.exports.__esModule = true;
