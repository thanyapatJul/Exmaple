import { Card, CardHeader, CardBody, CardFooter, Heading, Stack, StackDivider, Box, Text, Button, ButtonGroup, Divider } from '@chakra-ui/react'

export default function BlockContent() {
    return (
        <Card mt="10" mb="10">
            <CardHeader>
                <Heading size='xl'>Client Report</Heading>
            </CardHeader>

            <CardBody>
                <Stack divider={<StackDivider />} spacing='10'>
                    <Box>
                        <Heading size='md' textTransform='uppercase'>
                            Summary
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            View a summary of all your clients over the last month.
                            View a summary of all your clients over the last month.
                            View a summary of all your clients over the last month.
                            View a summary of all your clients over the last month.
                            View a summary of all your clients over the last month.
                            View a summary of all your clients over the last month.
                            View a summary of all your clients over the last month.
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Overview
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            Check out the overview of your clients.
                        </Text>
                    </Box>
                    <Box>
                        <Heading size='xs' textTransform='uppercase'>
                            Analysis
                        </Heading>
                        <Text pt='2' fontSize='sm'>
                            See a detailed analysis of all your business clients.
                        </Text>
                    </Box>
                </Stack>
            </CardBody>
            <CardFooter>
                <ButtonGroup spacing='2'>
                    <Button variant='solid' colorScheme='blue'>
                        Buy now
                    </Button>
                    <Button variant='ghost' colorScheme='blue'>
                        Add to cart
                    </Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
    )
}