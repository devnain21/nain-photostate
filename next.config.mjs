const isGithubPagesBuild = process.env.GITHUB_PAGES === 'true'
const basePath = isGithubPagesBuild ? '/CSC' : ''

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  ...(isGithubPagesBuild
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
}

export default nextConfig