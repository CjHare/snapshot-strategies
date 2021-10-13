import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { multicall } from '../../utils';

export const author = 'cjhare';
export const version = '0.1.0';

const abi = [
  'function getVotes(address account, bytes32 role) public view returns (uint256)'
];

export async function strategy(
  space,
  network,
  provider,
  addresses,
  options,
  snapshot
) {
  const blockTag = typeof snapshot === 'number' ? snapshot : 'latest';

  await validatePresence(options, 'An options object is expected');
  await validatePresence(options.address, 'Address is required in the options');
  await validatePresence(
    options.decimals,
    'Decimal is required in the options'
  );
  await validatePresence(options.role, 'Role is required in the options');

  const role = keccak256(toUtf8Bytes(options.role));

  //TODO remove - if/when new block works
/*
  const multi = new Multicaller(network, provider, abi, { blockTag });
  addresses.forEach((address) =>
    multi.call(address, options.address, 'getVotes', [address, role])
  );

  const result: Record<string, BigNumberish> = await multi.execute();

  return Object.fromEntries(
    Object.entries(result).map(([address, balance]) => [
      address,
      parseFloat(formatUnits(balance, options.decimals))
    ])
  );
*/

//TODO the abi isn't making it through - the 'getVotes' is lost

  const response: BigNumber[] = await multicall(
    network,
    provider,
    abi,
    addresses.map((address: any) => [
      'getVotes',
      [address.toLowerCase(), role]
    ]),
    { blockTag }
  );
  return Object.fromEntries(
    response.map((value, i) => [
      addresses[i],
      parseFloat(formatUnits(value.toString(), options.decimals))
    ])
  );
}

async function validatePresence(parameter: any, reason: string): Promise<void> {
  if (parameter === undefined) {
    return Promise.reject(reason);
  }
}
