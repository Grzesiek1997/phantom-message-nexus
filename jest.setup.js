import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Add TextEncoder and TextDecoder to the global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;