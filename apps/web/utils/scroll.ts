export const scrollToView = (id: string, pathname?: string) => {
    if (pathname && pathname !== "/") {
        // Cross-route navigation requires full page load; window.location.href is intentional here.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/#${id}`;
        return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}