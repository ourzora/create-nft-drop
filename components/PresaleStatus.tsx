import { useState, useEffect } from 'react'
import { SubgraphERC721Drop } from 'models/subgraph'
import { makeTreeFromUrl } from 'lib/merkle-proof'
import { MintStatus } from 'components/MintStatus'
import { useSaleStatus } from 'hooks/useSaleStatus'
import { ipfsImage } from 'lib/helpers'
import { useAccount, useDisconnect } from 'wagmi'
import { utils } from 'ethers'
import { Box, Text, Flex, Heading, Button, Stack, SpinnerOG } from '@zoralabs/zord'
import { useDropMetadataContract } from 'providers/DropMetadataProvider'

export function PresaleStatus({ collection }: { collection: SubgraphERC721Drop }) {
  const { data: account } = useAccount()
  const { disconnect } = useDisconnect()
  const { saleIsFinished } = useSaleStatus({ collection, presale: true })
  const { metadata } = useDropMetadataContract()
  const [merkleTree, setMerkleTree] = useState<any>()
  const [accessAllowed, setAccessAllowed] = useState<boolean>()
  const [allowlistEntry, setAllowlistEntry] = useState<any>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function asyncFunc() {
      if (metadata && collection.salesConfig.presaleMerkleRoot && metadata.allowlistURI) {
        const tree = await makeTreeFromUrl(ipfsImage(metadata.allowlistURI))
        if (tree) setMerkleTree(tree)
        setLoading(false)
      }
    }
    asyncFunc()
  }, [metadata, collection.salesConfig.presaleMerkleRoot])

  useEffect(() => {
    async function asyncFunc() {
      if (!merkleTree?.entries || !account?.address) return
      const entry = merkleTree.entries.find(
        (e: any) => utils.getAddress(e.minter) === utils.getAddress(account.address || '')
      )
      setAccessAllowed(!!entry && !!entry.proof.length)
      setAllowlistEntry(entry)
    }
    asyncFunc()
  }, [merkleTree, account])

  return (
    <Box className="zord-presale-status">
      {loading ? (
        <Stack align="center">
          <SpinnerOG />
        </Stack>
      ) : saleIsFinished ? (
        <Stack align="center">
          <Heading align="center" size="xs">
            Presale complete
          </Heading>
          <Text mt="x3" variant="paragraph-sm" color="tertiary" align="center">
            The presale window has ended. However, it is still possible to mint a NFT
            through the public sale.
          </Text>
        </Stack>
      ) : !account ? (
        <Stack align="center">
          <Button
            variant="circle"
            color="secondary"
            mx="auto"
            mb="x3"
            pointerEvents="none"
            style={{ height: 'auto' }}
          >
            {/* prettier-ignore */}
            <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14 7H13V5C13 2.24 10.76 0 8 0C5.24 0 3 2.24 3 5V7H2C0.9 7 0 7.9 0 9V19C0 20.1 0.9 21 2 21H14C15.1 21 16 20.1 16 19V9C16 7.9 15.1 7 14 7ZM8 16C6.9 16 6 15.1 6 14C6 12.9 6.9 12 8 12C9.1 12 10 12.9 10 14C10 15.1 9.1 16 8 16ZM11.1 7H4.9V5C4.9 3.29 6.29 1.9 8 1.9C9.71 1.9 11.1 3.29 11.1 5V7Z" fill="#4D4D4D"/> </svg>
          </Button>
          <Heading align="center" size="xs">
            Connect wallet to access presale
          </Heading>
          <Flex mt="x4" w="100%" flexChildren>
            <MintStatus presale collection={collection} showPrice={false} />
          </Flex>
        </Stack>
      ) : !accessAllowed ? (
        <Stack align="center">
          <Button
            variant="circle"
            mx="auto"
            mb="x3"
            pointerEvents="none"
            style={{ height: 'auto' }}
          >
            {/* prettier-ignore */}
            <svg width="16" height="21" viewBox="0 0 16 21" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M14 7H13V5C13 2.24 10.76 0 8 0C5.24 0 3 2.24 3 5V7H2C0.9 7 0 7.9 0 9V19C0 20.1 0.9 21 2 21H14C15.1 21 16 20.1 16 19V9C16 7.9 15.1 7 14 7ZM8 16C6.9 16 6 15.1 6 14C6 12.9 6.9 12 8 12C9.1 12 10 12.9 10 14C10 15.1 9.1 16 8 16ZM11.1 7H4.9V5C4.9 3.29 6.29 1.9 8 1.9C9.71 1.9 11.1 3.29 11.1 5V7Z" fill="#4D4D4D"/> </svg>
          </Button>
          <Heading align="center" size="xs">
            No presale access
          </Heading>
          <Text variant="paragraph-sm" color="tertiary" align="center">
            You do not have access to the presale. You may need to use a different wallet.
          </Text>
          <Flex mt="x4" w="100%" flexChildren>
            <Button onClick={() => disconnect()}>Switch wallet</Button>
          </Flex>
        </Stack>
      ) : (
        <MintStatus presale allowlistEntry={allowlistEntry} collection={collection} />
      )}
    </Box>
  )
}
