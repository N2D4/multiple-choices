import PropositionalLogicSolve from './DiscreteMathematics/exercises/PropositionalLogicSolve.js';
import SetsSolve from './DiscreteMathematics/exercises/SetsSolve.js';
import DiagonalizationProof from './DiscreteMathematics/proofs/DiagonalizationProof.js';
import ChineseRemainderTheorem from './DiscreteMathematics/exercises/ChineseRemainderTheorem.js';
import GCDLCD from './DiscreteMathematics/exercises/GCDLCD.js';
import Remainders from './DiscreteMathematics/exercises/Remainders.js';
import ModularInverse from './DiscreteMathematics/exercises/ModularInverse.js';
import EulerPhi from './DiscreteMathematics/exercises/EulerPhi.js';
import GroupSolve from './DiscreteMathematics/exercises/GroupSolve.js';



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
    { GCDLCD, weight: 0.5 },
    { Remainders, weight: 1 },
    { ModularInverse, weight: 0.5 },
    { ChineseRemainderTheorem, weight: 1 },
    { EulerPhi, weight: 0.25 },
    { GroupSolve, weight: 1.5 },
];