import React from "react"

const FooterContainer = () => (
  <footer className="footer-container grid items-center justify-center bg-cyan-500 dark:bg-cyan-700 font-serif text-white w-full p-2 shadow-xl z-10">
    <h4>&copy; {new Date().getFullYear()} SWAG</h4>
  </footer>
)

export default FooterContainer