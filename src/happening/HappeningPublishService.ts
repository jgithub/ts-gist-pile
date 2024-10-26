import { Happening } from "./Happening";

/**
 * Make simple events known.  Simply publish them.
 */

export interface HappeningPublishService {
  /*
   * Publishes a Happening to the event bus and does not wait around to confirm it was received.
   * Don't worry... this will all happen within a setTimeout(..., 0) block.
   */ 
  fireAndForget(happening: Happening): void;

  /*
   * This could also be named fireAndDontForget 
   * Publishes a Happening to the event bus and promises that upstream gives us a 201 Created.
   */ 
  publish(happening: Happening): Promise<void>;
}