/**
 * Doctor command - Health check for BrseKit installation
 */
interface DoctorOptions {
    fix?: boolean;
    verbose?: boolean;
}
/**
 * Doctor command handler
 */
export declare function doctorCommand(options: DoctorOptions): Promise<void>;
export {};
//# sourceMappingURL=doctor.d.ts.map