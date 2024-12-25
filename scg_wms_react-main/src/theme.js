import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
    colors: {
        gray: {
            900: "rgba(1,1,1,.98)"
        }
    },
    fonts: {
        heading: `'SCG-Bol', sans-serif`,
        body: `'SCG-REG', sans-serif`,
    },
    components: {
        Tooltip: {
            baseStyle: {
                maxW: "550px",
                zIndex: 5001
            },
        },
    },
})

export default theme