import React from 'react'

export default function AdminHeader(props)
{
    return (
        < header className='w-full bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% py-4 px-6 shadow-lg relative z-40' >
            <div className='flex justify-between items-center'>
                {/* Logo/Title */}
                <div className='flex items-center space-x-4'>
                    <div className='text-white league-font'>
                        <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold m-0'>2025</h1>
                        <h2 className='text-sm sm:text-lg md:text-xl font-bold m-0'>Calendar</h2>
                        <h3 className='text-xs sm:text-sm md:text-base font-sans m-0'>TSU ID</h3>
                        <h4 className='text-xs sm:text-sm md:text-base font-sans m-0'>Scheduling</h4>
                        <h5 className='text-xs sm:text-sm md:text-base font-sans m-0'>System</h5>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <div className='hidden sm:flex items-center space-x-4'>

                    <button
                        className='bg-blue-500 hover:bg-blue-600 border-2 border-[#107ac6] active:bg-blue-400 text-white px-4 py-2 rounded-lg'

                        onClick={props.HandleShowAddStudent}
                    >
                        Add Student
                    </button>
                    <button
                        onClick={props.HandleShowList}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        Download List
                    </button>
                    <button
                        onClick={props.handleLogoutClick}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>

                </div>

                {/* Mobile Hamburger Menu */}
                <div className='sm:hidden'>
                    <button
                        onClick={props.toggleMenu}
                        className='text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200'
                        aria-label="Toggle menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {props.isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {
                props.isMenuOpen && (
                    <div className='sm:hidden absolute top-full left-0 right-0 bg-gradient-to-bl from-[#641500] from-100% to-[#CA2A00] to-0% shadow-lg border-t border-white/20'>
                        <div className='flex flex-col space-y-3 p-4'>
                            <button
                                onClick={props.HandleChangeDate}
                                className="bg-[#E1A500] hover:bg-[#C68C10] text-white px-4 py-3 rounded-lg border-2 border-[#C68C10] transition-all duration-200 font-bold w-full text-center"
                            >
                                Change Date
                            </button>
                            <button
                                onClick={props.HandleShowList}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg w-full text-center"
                            >
                                Download List
                            </button>
                            <button
                                onClick={props.handleLogoutClick}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg w-full text-center"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )
            }
        </header >

    )
}
