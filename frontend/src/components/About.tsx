import { Divider, Heading, Text } from "@chakra-ui/react";
import { Anchor } from "../generic/Anchor";

export function About() {
  return (
    <>
      <Heading fontSize="3xl">What can I do with this?</Heading>
      <Heading fontSize="xl">Predictions.</Heading>
      <Text fontSize="lg">
        Make a private prediction now; publish it later. Prove that you made the
        prediction at the time you made it using the blockchain. Prevent the
        prediction from being censored by using decentralized storage.
      </Text>
      <Heading fontSize="xl">
        Responsible disclosure of security vulnerabilities.
      </Heading>
      <Text fontSize="lg">
        Suppose you discover a bug in iOS that lets you remotely hack a phone by
        sending it a text message. You'll want to write down the steps of how
        this is done and save it somewhere safe.
      </Text>
      <Heading fontSize="xl">Pre-register a scientific study.</Heading>
      <Text fontSize="lg">
        Science shouldn't be controlled by intermediaries if it can be avoided.
        Scientific institutions aren't software companies, but you have to trust
        them as if they are. You trust that an intern doesn't wipe their
        database, that they make regular backups, and so on. With this system,
        you have read and write access to the database by default. Easy data
        replication is also built-in. You also own your data and nobody can
        tamper with it after it's been saved.
      </Text>
      <Heading fontSize="xl">A tell-all.</Heading>
      <Text fontSize="lg">
        Suppose you're working at a company and it's all going poorly. You don't
        want to publish what you wrote right now. Later, after the company is
        dead and enough time has passed, you might want to publish your diary
        from that time in a provable way.
      </Text>
      <Anchor
        to="https://robert.ocallahan.org/2018/01/ancient-browser-wars-history-md5-hashed.html"
        color="blue.500"
        isExternal
      />
      <Heading fontSize="xl">
        Make statements that are controversial now, but may be less
        controversial later.
      </Heading>
      <Text fontSize="lg">
        What's socially acceptable changes over time. Before 2020, telling
        people you believe in UFOs would get you weird looks.
      </Text>
      <Heading fontSize="xl">Proof of invention.</Heading>
      <Text fontSize="lg">
        Isaac Newton and Gottfried Wilhelm Leibniz debated over who invented
        Calculus. Suppose Leibniz was first. If he had this tool, he would have
        been able to record hashes of his progress until he was ready to
        publish. His hashes would precede Newton's documents and writing, and
        he'd be able to get credit for being first.
      </Text>
      <Anchor
        to="https://en.wikipedia.org/wiki/Leibniz%E2%80%93Newton_calculus_controversy"
        color="blue.500"
        isExternal
      />
      <Heading fontSize="xl">A will.</Heading>
      <Text fontSize="lg">
        You want there to be no question about your wishes after your death.
        However, you likely want to keep your will private until then.
      </Text>
      <Divider />
      <Heading fontSize="3xl">
        Why doesn't something like this already exist?
      </Heading>
      <Text fontSize="lg">
        Before now, if you wanted to drop a hash, you had to post some random
        numbers and letters like this: "yrcBygJ3O31Qe3/B47BIcdzP" on a site. If
        they took it down, you'd have no way to prove that you had that document
        at a specific time. Notary services have always existed. This makes it
        easier to notarize documents. The other way would be to publish it in a
        newspaper, but those days are long gone.
      </Text>
    </>
  );
}
