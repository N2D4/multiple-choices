import ModularArithmetic from './DiscreteMathematics/exercises/ModularArithmetic.js';
import PropositionalLogicSolve from './DiscreteMathematics/exercises/PropositionalLogicSolve.js';
import SetsSolve from './DiscreteMathematics/exercises/SetsSolve.js';
import DiagonalizationProof from './DiscreteMathematics/proofs/DiagonalizationProof.js';
import ChineseRemainderTheorem from './DiscreteMathematics/exercises/ChineseRemainderTheorem.js';


export let SetName = "Discrete Mathematics";
export let SetIdentifier = "discmath18";


/* === TODO LIST ===
 * - Proofs: ...
 *
 * - Proof systems
 * - Calculi
 *
 * - Relations
 * - Uncountable sets
 * 
 * - Diffie-Hellman
 * 
 * - Algebras, Monoids, Groups, Rings, Fields, etc.
 * - Cyclic groups
 * - RSA
 * - Polynomial fields
 * - Error-correcting codes
 */

export default [
    { DiagonalizationProof, weight: 0.1 },
    { PropositionalLogicSolve, weight: 1 },
    { SetsSolve, weight: 1 },
    { ModularArithmetic, weight: 1 },
    { ChineseRemainderTheorem, weight: 0.5 }
];