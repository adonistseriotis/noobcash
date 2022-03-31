from backend.classes.block import Block
from backend.classes.blockchain import Blockchain
from backend.exceptions.nbc import NbcException
from utils.debug import log

class BlockchainException(NbcException):
    def __init__(self, blockchain: Blockchain, message="This blockchain is invalid"):
        self.message = message
        self.blockchain = blockchain
        log.error(self.__class__, ' -> ', message)
        log.warning(self.blockchain.__repr__)
        super().__init__(self.message)

class InvalidBlockchainException(BlockchainException):
    def __init__(self, blockchain: Blockchain, block: Block, message="This blockchain is invalid"):
        self.message = message
        self.block = block
        super().__init__(blockchain=blockchain, message=self.message)
        log.warning('\nThis block is the culprit: ', block.__repr__)
    