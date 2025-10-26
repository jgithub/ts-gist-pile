import { Happening } from "./Happening";
export interface HappeningPublishService {
    fireAndForget(happening: Happening): void;
    publish(happening: Happening): Promise<void>;
}
