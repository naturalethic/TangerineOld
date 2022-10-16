/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
	ignoredRouteFiles: ["**/.*"],
	serverBuildTarget: "esm",
	serverDependenciesToBundle: ["dot-prop"],
};
