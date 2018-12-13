import { createProofExercise } from '../../../createExercise.js';

export default (random) => {


    const set = `\\(\\{0, 1\\}^\\infty\\)`;

    return createProofExercise(random, {
        "question": `Show that the set of infinite bitstrings ${set} is uncountable.`,
        "proof": [
            [
                `To show that ${set} is uncountable, we do a proof by contradiction.`,
                `To show that ${set} is uncountable, we do a direct proof.`,
                `To show that ${set} is uncountable, we use the modus ponens.`,
            ],
            [
                `First, we assume that ${set} is countable. In other words, we assume that there is an injection \\(f\\) from ${set} to \\(\\mathbb{N}\\).`,
                `First, we assume that ${set} is uncountable. In other words, we assume that there is no injection \\(f\\) from ${set} to \\(\\mathbb{N}\\).`,
                `First, we assume that ${set} is uncountable. In other words, we assume that there is no surjection \\(f\\) from ${set} to \\(\\mathbb{N}\\).`,
            ],
            [
                `Because that means each element in the image space of \\(f\\) is the function output of at most one input, we know that there is a (possibly infinite) sequence \\(z_i\\) containing all bitstrings in ${set} such that \\(z_i = x\\) for some \\(x\\) with \\(f(x) = i\\), or \\(z_i = (0, 0, 0, \\ldots )\\) if there is no such \\(x\\).`,
                `Because that means each element in the image space of \\(f\\) is the function output of at least one input, we know that there is a (possibly infinite) sequence \\(z_i\\) containing all bitstrings in ${set} such that \\(z_i = x\\) for any \\(x\\) with \\(f(x) = i\\) .`,
                `Because that means each element in the image space of \\(f\\) is the function output of at most one input, there is also no bijection \\(g\\) from ${set} to \\(\\mathbb{N}\\).`,
            ],
            [
                `In order to find a contradiction with the assumption, we now try to construct a bitstring \\(x\\) which is in ${set} but not in \\(z\\).`,
                `In order to find a contradiction with the assumption, we now try to construct a bitstring \\(x\\) which is in \\(z\\) but not in ${set}.`,
                `In order to find a contradiction with the assumption, we now try to construct a bitstring \\(x\\) which is in ${set} and also in \\(z\\).`,
                `In order to find a contradiction with the assumption, we now try to construct a bitstring \\(x\\) which is neither in \\(z\\) nor in ${set}.`,
            ],
            [
                `For this, we take the inverse of the first bit of \\(z_1\\).`,
                `For this, we take the inverse of \\(z_1\\), and invert it.`,
                `For this, we take the inverse of the last bit of \\(z_1\\).`,
            ],
            [
                `If we set the first bit of \\(x\\) to the inverted bit from \\(z_1\\), now no matter what comes after, \\(x\\) will never be equal to \\(z_1\\).`,
                `If we set the first bit of \\(x\\) to the inverted bit from \\(z_1\\), now no matter what comes after, \\(x\\) will always be equal to \\(z_1\\).`,
                `If we set the first bit of \\(x\\) to the inverted bit from \\(z_1\\), now no matter what comes after, \\(x\\) will only be equal to \\(z_1\\) if all the remaining bits are.`,
            ],
            [
                `We now repeat this for the second bit of \\(x\\) and the second bit of \\(z_2\\), and so on.`,
                `We now repeat this for the second bit of \\(x\\) and the first bit of \\(z_2\\), and so on.`,
                `We now repeat this for the first bit of \\(x\\) and the second bit of \\(z_2\\), and so on.`,
            ],
            [
                `Our bitstring is now different than each of the bitstrings in \\(z\\), differing by at least one bit.`,
                `Our bitstring is now different than each of the bitstrings in ${set}, differing by at least one bit.`,
                `We've now found a bitstring in \\(z\\) with a finite length.`,
            ],
            [
                `However, this contradicts the assumption that \\(z\\) contains all bitstrings in ${set}, and so the assumption cannot be true.`,
                `However, this contradicts the assumption that all bitstrings in ${set} are infinite, and so the assumption cannot be true.`,
                `Therefore, we have shown that the assumption is correct.`,
            ],
        ],
    });
};
