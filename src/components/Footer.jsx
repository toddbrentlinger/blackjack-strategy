function Footer({ children, initialYear, sourceCodeUrl }) {
    const getCopyrightString = () => {
        const currentYear = new Date().getFullYear();
        return (currentYear === initialYear)
            ? initialYear
            : `${initialYear}-${currentYear}`;
    };

    return (
        <footer>
            <p>
                <small>
                    <a href={sourceCodeUrl} target="_blank" rel="noreferrer">Source Code</a> &copy; <time id="copyright-current-year">{getCopyrightString()}</time> Todd Brentlinger, Santa Cruz, CA, USA. All Rights Reserved.
                </small>
            </p>
            {children}
        </footer>
    );
}

export default Footer;
